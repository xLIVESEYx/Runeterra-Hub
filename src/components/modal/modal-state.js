let closeToken = 0;

export function bumpCloseToken() {
  closeToken++;
}

export function getCloseToken() {
  return closeToken;
}
