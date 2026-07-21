async function apiRequest(method, path, body, isForm) {
  const opts = { method, credentials: "same-origin" };
  if (body !== undefined) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers = { "Content-Type": "application/json" };
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(path, opts);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function apiGet(path) {
  return apiRequest("GET", path, undefined, false);
}

function apiPost(path, body) {
  return apiRequest("POST", path, body, false);
}

function apiPostForm(path, formData) {
  return apiRequest("POST", path, formData, true);
}
