import { useEffect, useState } from "react"

import "./sidepanel.css"

import { ChatGPTError } from "~types"

async function getSession() {
  let response: Response
  try {
    const url = "https://chat.openai.com/api/auth/session"
    const headers = {
      ...this._headers,
      accept: "*/*"
    }

    if (this._debug) {
      console.log("GET", url, headers)
    }

    const res = await fetch(url, {
      headers
    }).then((r) => {
      response = r

      if (!r.ok) {
        const error = new ChatGPTError(
          `ChatGPT error: ${r.status} ${r.statusText}`
        )
        error.response = r
        error.statusCode = r.status
        error.statusText = r.statusText
        throw error
      }

      return r.json() as any
    })

    const accessToken = res?.accessToken

    if (!accessToken) {
      const error = new ChatGPTError("ChatGPT error: Unauthorized")
      error.response = response
      error.statusCode = response?.status
      error.statusText = response?.statusText
      throw error
    }

    const appError = res?.error
    if (appError) {
      if (appError === "RefreshAccessTokenError") {
        const error = new ChatGPTError(
          "ChatGPT error: session token may have expired"
        )
        error.response = response
        error.statusCode = response?.status
        error.statusText = response?.statusText
        throw error
      } else {
        const error = new ChatGPTError(appError)
        error.response = response
        error.statusCode = response?.status
        error.statusText = response?.statusText
        throw error
      }
    }
    return accessToken
  } catch (err: any) {
    const error = new ChatGPTError(
      `ChatGPT failed to refresh auth token. ${err.toString()}`
    )
    error.response = response
    error.statusCode = response?.status
    error.statusText = response?.statusText
    error.originalError = err
    throw error
  }
}

function IndexSidePanel() {
  const [loading, setLoading] = useState(true)
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    getSession()
      .then(() => {
        setLoading(false)
        setIsLogged(true)
      })
      .catch(() => {
        setLoading(false)
        setIsLogged(false)
      })
  }, [])

  if (loading) {
    return <div id="overlay">loading...</div>
  }

  if (isLogged) {
    return (
      <iframe src="https://chat.openai.com/g/g-uMvb5vRf2-notion-copilot-unofficial"></iframe>
    )
  }
  return (
    <div id="overlay">
      <div className="login">
        <p>Log in with your OpenAI account</p>
        <div className="buttons">
          <a href="https://chat.openai.com" target="_blank">
            <button className="button">Login</button>
          </a>
          <button className="button" onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexSidePanel
