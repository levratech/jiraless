import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import yaml from 'js-yaml';

function IssuesList({ config }) {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    async function fetchIssues() {
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/.project/objects/issues?ref=${config.branch}`;
      const res = await fetch(url);
      const files = await res.json();
      const issuePromises = files.filter(f => f.name.endsWith('.md')).map(async (f) => {
        const contentRes = await fetch(f.download_url);
        const text = await contentRes.text();
        const frontMatter = text.split('---')[1];
        const data = yaml.load(frontMatter);
        return { ...data, url: f.download_url };
      });
      const issues = await Promise.all(issuePromises);
      setIssues(issues);
    }
    fetchIssues();
  }, [config]);

  return (
    <div>
      <h2>Issues</h2>
      <ul className="issue-list">
        {issues.map(issue => (
          <li key={issue.id} className="issue-item">
            <Link to={`/issues/${issue.id}`}>{issue.title}</Link> - {issue.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IssuesList;