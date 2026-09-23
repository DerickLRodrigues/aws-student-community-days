#!/usr/bin/env python3
"""Move the domain after preview verification. Dry run unless --apply is supplied."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--profile', default='deploy')
    parser.add_argument('--aws-cli', default=shutil.which('aws') or 'aws')
    args = parser.parse_args()
    cfg = json.loads((ROOT / 'infra/deploy-config.json').read_text(encoding='utf-8'))
    cli = [args.aws_cli, '--profile', args.profile, '--region', cfg['region'], '--no-cli-pager']

    def aws(*command):
        result = subprocess.run(cli + list(command), check=True, text=True, capture_output=True)
        return json.loads(result.stdout) if result.stdout.strip() else {}

    print(f"1. Verify https://{cfg['cloudfront_domain']}")
    print(f"2. Detach {cfg['domain']} from Amplify (keep the app)")
    print('3. Enable apex + www aliases on the new CloudFront distribution')
    print('4. Replace only apex/www website records with A and AAAA aliases')
    print('5. Verify production HTTPS. Domain release can cause a temporary interruption.')
    if not args.apply:
        print('DRY RUN: no changes. Run again with --apply to perform the migration.')
        return
    if cfg['distribution_id'].startswith('PENDING'):
        parser.error('Infrastructure has not been created yet')
    identity = aws('sts', 'get-caller-identity')
    if identity['Account'] != cfg['role_arn'].split(':')[4]:
        parser.error('Profile points at a different AWS account')
    subprocess.run([sys.executable, str(ROOT / 'scripts/smoke-test.py'),
                    f"https://{cfg['cloudfront_domain']}"], check=True)
    distribution = aws('cloudfront', 'get-distribution', '--id', cfg['distribution_id'])['Distribution']
    if distribution['Status'] != 'Deployed':
        parser.error('Wait until the CloudFront distribution is Deployed')
    aliases = distribution['DistributionConfig'].get('Aliases', {}).get('Items', [])
    certificate_arn = distribution['DistributionConfig']['ViewerCertificate']['ACMCertificateArn']
    certificate = aws('acm', 'describe-certificate', '--certificate-arn', certificate_arn)['Certificate']
    if certificate['Status'] != 'ISSUED':
        parser.error('Certificate must be ISSUED before domain migration')
    associations = aws('amplify', 'list-domain-associations', '--app-id', cfg['amplify_app_id'])['domainAssociations']
    association = next((item for item in associations if item['domainName'] == cfg['domain']), None)
    records = aws('route53', 'list-resource-record-sets', '--hosted-zone-id', cfg['hosted_zone_id'])['ResourceRecordSets']
    local = ROOT / '.deploy-local'
    local.mkdir(exist_ok=True)
    backup = local / 'before-domain-cutover.json'
    if not backup.exists():
        backup.write_text(json.dumps({'domain_association': association, 'records': records}, indent=2), encoding='utf-8')
    if association:
        aws('amplify', 'delete-domain-association', '--app-id', cfg['amplify_app_id'], '--domain-name', cfg['domain'])
        print('Amplify domain detached; the app is still present.', flush=True)
    # Amplify releases its managed CloudFront alias asynchronously. Avoid a failed
    # CloudFormation update while that old alias still exists.
    for attempt in range(30):
        if cfg['domain'] in aliases:
            break
        conflicts = aws('cloudfront', 'list-conflicting-aliases', '--distribution-id',
                        cfg['distribution_id'], '--alias', cfg['domain'])
        items = conflicts.get('ConflictingAliasesList', {}).get('Items', [])
        conflicts_elsewhere = [item for item in items
                               if item.get('Alias') == cfg['domain']
                               and item.get('DistributionId') != cfg['distribution_id']]
        if not conflicts_elsewhere:
            break
        print(f'Waiting for Amplify to release the CloudFront alias ({attempt + 1}/30)...', flush=True)
        time.sleep(30)
    else:
        raise RuntimeError('Domain is still associated with the old distribution. See infra/DEPLOY.md; rerun after release.')
    # If the old distribution has not released its aliases yet, deployment fails safely
    # before DNS is changed. Wait for UPDATE_ROLLBACK_COMPLETE, then rerun this command.
    subprocess.run(cli + ['cloudformation', 'deploy', '--stack-name', cfg['stack_name'],
                          '--template-file', str(ROOT / 'infra/03-static-site.yaml'),
                          '--parameter-overrides', f"HostedZoneId={cfg['hosted_zone_id']}", 'EnableAliases=true',
                          '--capabilities', 'CAPABILITY_IAM', '--no-fail-on-empty-changeset'], check=True)
    aws('cloudfront', 'wait', 'distribution-deployed', '--id', cfg['distribution_id'])
    names = [cfg['domain'] + '.', 'www.' + cfg['domain'] + '.']
    # Refresh records because Amplify may have removed its DNS records on detachment.
    records = aws('route53', 'list-resource-record-sets', '--hosted-zone-id', cfg['hosted_zone_id'])['ResourceRecordSets']
    changes = [{'Action': 'DELETE', 'ResourceRecordSet': record} for record in records
               if record['Name'] in names and record['Type'] == 'CNAME']
    for name in names:
        for record_type in ('A', 'AAAA'):
            changes.append({'Action': 'UPSERT', 'ResourceRecordSet': {
                'Name': name, 'Type': record_type, 'AliasTarget': {
                    'HostedZoneId': 'Z2FDTNDATAQYW2',
                    'DNSName': cfg['cloudfront_domain'] + '.', 'EvaluateTargetHealth': False}}})
    batch = local / 'dns-cutover.json'
    batch.write_text(json.dumps({'Comment': 'Migrate static site from Amplify to S3 and CloudFront', 'Changes': changes}), encoding='utf-8')
    result = aws('route53', 'change-resource-record-sets', '--hosted-zone-id', cfg['hosted_zone_id'],
                 '--change-batch', 'file://' + batch.as_posix())
    aws('route53', 'wait', 'resource-record-sets-changed', '--id', result['ChangeInfo']['Id'])
    subprocess.run([sys.executable, str(ROOT / 'scripts/smoke-test.py'), f"https://{cfg['domain']}"], check=True)
    print('Domain migration complete. Verify www redirect and the GitHub Actions run before deleting the Amplify app.')


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as exc:
        if exc.stderr:
            print(exc.stderr, file=sys.stderr)
        print('Migration stopped. Keep Amplify; inspect the error and the backup in .deploy-local before retrying.', file=sys.stderr)
        raise SystemExit(exc.returncode)
