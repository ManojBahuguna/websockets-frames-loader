const defaultTimeout = 100;

const getStringFromBuffer = (buffer) => {
  var arrayBufferView = new Uint8Array(buffer);
  var blob = new Blob([arrayBufferView], { type: "image/jpeg" });
  var imageUrl = window.URL.createObjectURL(blob);
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

const removeRenderer = (id) => {
  if (renderers.has(id)) {
    const renderer = renderers.get(id);
    renderer.element.remove();
    renderers.delete(id);
  }
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
  const socket = window.io({
    transports: ['websocket']
  });

  socket.on('connect', async () => {
    renderingLoop();
  });


  socket.on('frame', (...data) => {
    renderReceivedFrame(...data);
  })
}

socket.on('endstream', (id) => {
  removeRenderer(id);
});

init();