module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './src/index.html'],
  darkMode: false,
  theme: {
    extend: {
      transitionDuration: {
        '2000': '2000ms',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['responsive', 'hover', 'focus', 'group-hover'],
      translate: ['responsive', 'hover', 'focus', 'group-hover'],
    },
  },
  plugins: [],
}
