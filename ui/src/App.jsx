import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IssuesList from './components/IssuesList';
import IssueDetail from './components/IssueDetail';

const config = window.__JIRALESS__ || { owner: 'levratech', repo: 'jiraless', branch: 'main' };

function App() {
  return (
    <Router>
      <div className="container">
        <h1>Jiraless</h1>
        <Routes>
          <Route path="/issues" element={<IssuesList config={config} />} />
          <Route path="/issues/:id" element={<IssueDetail config={config} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;