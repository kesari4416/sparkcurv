/**
 * One shared pointer listener for every effect that follows the mouse (custom cursor,
 * accent gradient, 3D parallax). The values are read inside animation loops, never
 * through React state, so moving the mouse causes no re-renders.
 */
export const pointer = {
  /** Viewport pixels. */
  x: 0,
  y: 0,
  /** Normalised to -1..1, origin at the centre, y pointing up (matches three.js). */
  nx: 0,
  ny: 0,
  /** False until the first move, so effects can stay centred on touch devices. */
  active: false,
};

let bound = false;

export function bindPointer() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  pointer.x = window.innerWidth / 2;
  pointer.y = window.innerHeight / 2;
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointer.active = true;
    },
    { passive: true },
  );
}
