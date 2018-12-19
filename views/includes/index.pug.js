//@ts-check
/**
 * @type {HTMLButtonElement}
 */
let btn = document.querySelector("#btn")
let girdi = document.querySelector("#girdi")

btn.onclick = () => {
  girdi.classList.contains("hidden")
    ? girdi.classList.remove("hidden")
    : girdi.classList.add("hidden")
}