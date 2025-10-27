import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import yaml from 'js-yaml';
import { marked } from 'marked';

function IssueDetail({ config }) {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [backlinks, setBacklinks] = useState([]);

  useEffect(() => {
    async function fetchIssue() {
      const listUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/.project/objects/issues?ref=${config.branch}`;
      const listRes = await fetch(listUrl);
      const files = await listRes.json();
      const file = files.find(f => f.name.includes(id));
      if (!file) return;
      const contentRes = await fetch(file.download_url);
      const text = await contentRes.text();
      const parts = text.split('---');
      const frontMatter = yaml.load(parts[1]);
      const content = parts.slice(2).join('---');
      setIssue({ ...frontMatter, content });
    }

    async function fetchBacklinks() {
      const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/.project/views/backlinks.json?ref=${config.branch}`;
      const res = await fetch(url);
      const data = await res.json();
      const decoded = JSON.parse(atob(data.content));
      setBacklinks(decoded[id] || []);
    }

    fetchIssue();
    fetchBacklinks();
  }, [id, config]);

  if (!issue) return <div>Loading...</div>;

  return (
    <div className="issue-detail">
      <h2>{issue.title}</h2>
      <p>Status: {issue.status}</p>
      <p>Priority: {issue.priority}</p>
      <p>Assignees: {issue.assignees?.join(', ')}</p>
      <p>Labels: {issue.labels?.join(', ')}</p>
      <div dangerouslySetInnerHTML={{ __html: marked(issue.content) }} />
      <h3>Backlinks</h3>
      <ul>
        {backlinks.map(link => (
          <li key={link.from}>{link.from} ({link.type})</li>
        ))}
      </ul>
    </div>
  );
}

export default IssueDetail;