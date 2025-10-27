function cfg(){ return (window as any).__JIRALESS__ || { owner:'', repo:'', branch:'main' } }

export async function ghDispatch(event_type: string, client_payload: any, pat: string){
  const { owner, repo } = cfg()
  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${pat}`,
      'Accept': 'application/vnd.github+json'
    },
    body: JSON.stringify({ event_type, client_payload })
  })
  return { ok: res.ok, status: res.status, text: await res.text() }
}