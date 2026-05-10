import katex from 'katex'

import 'katex/dist/katex.min.css'

export function renderMath(
  selector = '.question-html'
) {

  setTimeout(() => {

    document.querySelectorAll(
      `${selector} [data-type="inline-math"]`
    ).forEach((el) => {

      const latex =
        el.getAttribute('data-latex')

      if (!latex) return

      if (
        el.dataset.rendered === 'true'
      ) return

      katex.render(
        latex,
        el,
        {
          throwOnError: false
        }
      )

      el.dataset.rendered = 'true'
    })

    document.querySelectorAll(
      `${selector} [data-type="block-math"]`
    ).forEach((el) => {

      const latex =
        el.getAttribute('data-latex')

      if (!latex) return

      
      if (
        el.dataset.rendered === 'true'
      ) return

      katex.render(
        latex,
        el,
        {
          throwOnError: false,

          displayMode: true
        }
      )

      el.dataset.rendered = 'true'
    })

  }, 100)
}