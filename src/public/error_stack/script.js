function showFormattedFrames(button) {
  const parent = button.closest('section')

  const formattedFrames = parent.querySelector('#stack-frames-formatted')
  formattedFrames.classList.add('visible')

  const rawFrames = parent.querySelector('#stack-frames-raw')
  rawFrames.classList.remove('visible')

  button.parentElement.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'))
  button.classList.add('active')
}

function showRawFrames(button) {
  const parent = button.closest('section')

  const formattedFrames = parent.querySelector('#stack-frames-formatted')
  formattedFrames.classList.remove('visible')

  const rawFrames = parent.querySelector('#stack-frames-raw')
  rawFrames.classList.add('visible')

  button.parentElement.querySelectorAll('button').forEach((btn) => btn.classList.remove('active'))
  button.classList.add('active')
}

function toggleFrameSource(parent) {
  if (parent.classList.contains('expanded')) {
    parent.classList.remove('expanded')
  } else {
    parent.classList.add('expanded')
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#formatted-frames-toggle').addEventListener('click', function () {
    showFormattedFrames(this)
  })
  document.querySelector('#raw-frames-toggle').addEventListener('click', function () {
    showRawFrames(this)
  })

  document.querySelectorAll('button[class="stack-frame-location"]').forEach((sfl) => {
    sfl.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        return
      }
      toggleFrameSource(e.target.closest('li'))
    })
  })

  document.querySelectorAll('button[class="stack-frame-toggle-indicator"]').forEach((sfl) => {
    sfl.addEventListener('click', function (e) {
      toggleFrameSource(e.target.closest('li'))
    })
  })
})
