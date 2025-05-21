const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');
const Colors = require('../../libs/ui/src/lib/Variables/Colors');
const topBarHeight = '50px';
const titleBarHeight = '21px';

const heightWithoutTopBar = `calc(100dvh - ${topBarHeight})`;
const heightWithoutTopBarMobile = `calc(100dvh - ${topBarHeight})`;

const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
    'node_modules/flowbite-react/lib/esm/**/*.js',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',

  theme: {
    extend: {
      flex: {
        '1': '1 1 0%',
        '2': '2 1 0%',
        '3': '3 1 0%',
        '4': '4 1 0%',
      },
      backgroundImage: {
        'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      typography: {
        sm: {
          css: {
            color: '#ccc',
            fontSize: '15px',
          },
        },
      },
      spacing: {
        px: '1px',
        0: '0',
        96: '96px',
        210: '210px',
        250: '250px',
      },
      width: {
        widthSideBar: `calc(100vw - 72px)`,
        widthHeader: `calc(100% - 344px)`,
        "4/5": "80%",
        "9/10": "90%",
        widthTitleBar: '100%'
      },
      height: {
        heightWithoutTopBar,
        heightWithoutTopBarMobile,
        heightTopBar: topBarHeight,
        heightHeader: "50px",
        "9/10": "90%",
        heightTitleBar: `calc(100dvh - ${titleBarHeight})`,
        heightTitleBarWithoutTopBar: `calc(calc(100dvh - 30px) - 21px)`,
        heightTitleBarWithoutTopBarMobile: `calc(${heightWithoutTopBarMobile} - ${titleBarHeight})`
      },

      maxWidth: {
        '9/10': '90%',
        '2/5': "40%"
      },

      maxHeight: {
        '4/5': '80%',
        '9/10': "90%",
        "50vh": "50vh"
      },

      minHeight: {
        600: '600px'
      },

      fontFamily: {
        ggSans: ['gg sans', 'sans-serif'],
      },
      fontSize: {
        header: ['5rem', '5rem'],
        headerMobile: ['3.125rem', '3.75rem'],
        subHeaderMobile: '1.563rem',
        contentMobile: '1.25rem',
      },
      colors: Colors,
      transitionDuration: {
        3000: '3000ms',
      },
      keyframes: {
        rotation: {
          '0%': {
            transform: 'rotate3d(0, 1, 0, 0deg)',
          },
          '50%': {
            transform: 'rotate3d(0, 1, 0, 180deg)',
          },
          '100%': {
            transform: 'rotate3d(0, 1, 0, 360deg)',
          },
        },
        faded_input: {
          '0%': {
            opacity: 0.80,
          },
          '100%': {
            opacity: 1,
          },
        },
        scale_up: {
          '0%': {
            opacity: 0.5,
            transform: 'scale(0.8,0.8)'
          },
          '50%': {
            opacity: 1
          },
          '100%': {
            transform: "scale(1)"
          }
        },
        scale_down: {
          '0%': {
            transform: "scale(1)",
            opacity: 1
          },
          '100%': {
            opacity: 0,
            transform: 'scale(0,0)'
          }
        },
        height_logo:{
          from : {
            height:'0px'
          },
          to : {
            height:'60px'
          }
        },
        move_out_logo : {
          from : {
            height:'60px'
          },
          to : {
            height:'0px'
          }
        },
        fly_in: {
          '0%': {
            opacity: 0.5,
            transform: 'translateX(20px)'
          },
          '50%': {
            opacity: 1
          },
          '100%': {
            transform: 'translateX(0px)'
          }
        },
        slide_in: {
          '0%': {
            transform: 'translateX(120px)',
            opacity: 0.7
          },
          '100%': {
            transform: 'translateX(0px)',
            opacity: 1
          }
        },
        pulse: {
          '50%': {
            opacity: 0.5
          }
        },
        move_down: {
          '0%': { transform: 'translateY(-20px)', opacity: '0.8' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        rotation: 'rotation 6s linear infinite',
        spin: 'spin 1s linear infinite',
        faded_input: 'faded_input 0.05s ease-in-out forwards',
        scale_up: 'scale_up 0.2s ease-in-out forwards',
        scale_down : 'scale_down 0.2s ease-in-out forwards',
        height_logo: 'height_logo 0.2s ease-in-out forwards',
        move_out_logo: 'move_out_logo 0.2s ease-in-out forwards',
        fly_in: 'fly_in 0.2s ease-in-out forwards',
        slide_in: 'slide_in 0.5s ease-in-out forwards',
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        move_down: 'move_down 0.5s forwards'
      },
      screens: {
        ssm: "430px",
        sbm: "480px",
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
        '.overflow-anchor-none': {
          'overflow-anchor': 'none'
        },
        '.overflow-anchor-auto': {
          'overflow-anchor': 'auto'
        }
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }),
    require('@tailwindcss/typography'),
  ],
};
