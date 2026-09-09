import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
const artifacts = 'temp/tasks/fix/46123-0909-112926/artifacts';
const git = (...args: string[]) => execFileSync('git', args, {encoding:'utf8'}).trim();
const files = git('diff','origin/main','--name-only').split('\n').filter(file => /\.(tsx?|jsx?)$/u.test(file) && !/\.(test|stories|spec)\./u.test(file));
const tests = files.flatMap(file => {
  const stem = file.replace(/\.(tsx?|jsx?)$/u, '');
  return ['ts','tsx','js','jsx'].map(ext => `${stem}.test.${ext}`).filter(existsSync);
});
writeFileSync(`${artifacts}/coverage-scope.json`, JSON.stringify({files,tests},null,2));
if (!process.argv.includes('--analyze-only')) {
  const result = spawnSync('yarn', ['jest', ...tests,'--runInBand','--coverage','--coverageReporters=lcov','--coverageReporters=json',`--coverageDirectory=${artifacts}/coverage`, ...files.map(file=>`--collectCoverageFrom=${file}`)], {stdio:'inherit'});
  if(result.status !== 0) process.exit(result.status ?? 1);
}
const lcov = readFileSync(`${artifacts}/coverage/lcov.info`,'utf8');
const results = files.map(file => {
  const record = lcov.split('end_of_record').find(item => item.split('\n').some(line => line.startsWith('SF:') && relative(process.cwd(),resolve(line.slice(3))) === file));
  if(!record) return {file,pass:false,error:'Missing coverage record'};
  const hits = new Map(record.split('\n').filter(line=>line.startsWith('DA:')).map(line => line.slice(3).split(',').map(Number) as [number,number]));
  const changed = new Set<number>();
  for (const match of git('diff','--unified=0','origin/main','--',file).matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gmu)) {
    const start = Number(match[1]); const count = match[2] === undefined ? 1 : Number(match[2]);
    for(let line = start; line < start+count; line+=1) changed.add(line);
  }
  const executable = [...changed].filter(line=>hits.has(line));
  const uncovered = executable.filter(line=>!hits.get(line));
  const total=executable.length; const covered=total-uncovered.length;
  const percentage=total ? 100*covered/total : null;
  return {file,total,covered,percentage,uncovered,pass:percentage === null || percentage >= 80};
});
const report={generatedAt:new Date().toISOString(),basis:'git diff origin/main against current working tree',threshold:80,pass:results.every(item=>item.pass),results};
writeFileSync(`${artifacts}/coverage-report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
process.exit(report.pass ? 0 : 1);
