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

function toggleFrameSource(event, parentId) {
  if (event.target.tagName === 'A') {
    return
  }

  const frame = document.querySelector(`#${parentId}`)
  if (!frame) {
    return
  }

  if (frame.classList.contains('expanded')) {
    frame.classList.remove('expanded')
  } else {
    frame.classList.add('expanded')
  }
}

document
  .getElementById('formatted-frames')
  ?.addEventListener(
    'click',
    function(){
      showFormattedFrames(this)
    }
  )
document
  .getElementById('raw-frames')
  ?.addEventListener(
    'click',
    function(){
      showRawFrames(this)
    }
  )
document
  .querySelectorAll("[id^='stack-frame-location-']")
  .forEach((sfl) => {
    sfl.addEventListener(
      'click',
      function(e){
        toggleFrameSource(e, this.id.replace('stack-frame-location-', 'frame-'))
      }
    )
  })
document
  .querySelectorAll("[id^='stack-frame-toggle-indicator-']")
  .forEach((sfti) => {
    sfti.addEventListener(
      'click',
      function(e){
        toggleFrameSource(e, this.id.replace('stack-frame-toggle-indicator-', 'frame-'))
      }
    )
  })
