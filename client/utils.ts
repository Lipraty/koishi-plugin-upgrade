export function compare(v1: string, v2: string) {
  if (v1 === v2) return 0
  const v1Parts = v1.split('.').map(Number)
  const v2Parts = v2.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) {
      return 1
    } else if (v1Parts[i] < v2Parts[i]) {
      return -1
    }
  }
  return 0
}

export async function renderGFM(markdown: string) {
  const res = await fetch('https://api.github.com/markdown', {
    method: 'POST',
    headers: {
      accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      text: markdown,
      mode: 'gfm'
    })
  })
  if (res.status === 200) return res.text()
  else throw markdown
}
