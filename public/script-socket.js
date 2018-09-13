const defaultTimeout = 100;

const getStringFromBuffer = (buffer) => {
  var imageUrl = window.URL.createObjectURL(buffer);
  return imageUrl;
};

const renderers = new Map;
const renderReceivedFrame = (id, frame) => {
  if (!renderers.has(id)) {
    const element = document.createElement('img');
    element.id = id;
    element.title = id;

    document.body.appendChild(element);
    renderers.set(id, { element });
  }

  // renderers.get(id).src = frame;
  renderers.get(id).src = getStringFromBuffer(frame);
};

const renderingLoop = () => {
  renderers.forEach(({ element, src }) => {
    element.src = src;
  });
  window.setTimeout(() => {
    window.requestAnimationFrame(renderingLoop);
  }, defaultTimeout);
};

const init = () => {
  const ws = new WebSocket(`ws://${location.host}/whatever`);
  ws.binaryType = 'blob';
  ws.addEventListener('open', async () => {
    console.log('socket connected!');
    window.ws = ws;
    renderingLoop();
  });

  ws.addEventListener('message', ({ data }) => {
    renderReceivedFrame('stream', data);
    console.log(data);
  });
}

init();