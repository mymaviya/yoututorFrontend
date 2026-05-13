import katex from 'katex'
import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'

export const renderMath = (root = document) => {
  const containers =
    typeof root === 'string'
      ? document.querySelectorAll(root)
      : [root]

  containers.forEach((container) => {
    if (!container) return

    const latexElements = [
      ...(container.matches?.('[data-latex]') ? [container] : []),
      ...container.querySelectorAll('[data-latex]')
    ]

    latexElements.forEach((el) => {
      const latex = el.getAttribute('data-latex')

      if (latex) {
        try {
          katex.render(latex, el, {
            throwOnError: false,
            displayMode: el.dataset.display === 'true'
          })
        } catch (error) {
          el.textContent = latex
        }
      }
    })

    renderMathInElement(container, {
      throwOnError: false,
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false }
      ],
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      ignoredClasses: ['katex']
    })
  })
}
