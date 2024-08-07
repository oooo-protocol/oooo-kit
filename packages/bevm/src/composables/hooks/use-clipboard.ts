export const useClipboard = () => {
  async function copy (value: string, el?: HTMLElement) {
    if (value != null) {
      let isSupportClipboardApi = false
      if (navigator != null && 'clipboard' in navigator) {
        const status = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName })
        isSupportClipboardApi = isAllowed(status.state)
      }
      if (isSupportClipboardApi) {
        await navigator!.clipboard.writeText(value)
      } else {
        legacyCopy(value, el)
      }
    }
  }

  function legacyCopy (value: string, el = document.body) {
    const ta = document.createElement('textarea')
    ta.value = value ?? ''
    ta.style.position = 'absolute'
    ta.style.opacity = '0'
    el.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }

  function isAllowed (status: PermissionState | undefined) {
    return status === 'granted' || status === 'prompt'
  }

  return {
    copy
  }
}
