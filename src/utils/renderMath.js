import katex from 'katex'
import 'katex/dist/katex.min.css'

export const renderMath = (root = document) => {
  const container =
    typeof root === 'string'
      ? document.querySelector(root)
      : root

  if (!container) return

  container
    .querySelectorAll('[data-latex]')
    .forEach((el) => {
      const latex = el.getAttribute('data-latex')

      if (!latex) return

      try {
        katex.render(latex, el, {
          throwOnError: false,
          displayMode: el.dataset.display === 'true'
        })
      } catch (error) {
        el.textContent = latex
      }
    })
}