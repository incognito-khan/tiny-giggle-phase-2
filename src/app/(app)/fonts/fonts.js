import { Baloo_2, Roboto } from 'next/font/google';
import '@fontsource/amatic-sc/400.css';
import '@fontsource/amatic-sc/700.css';

export const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['400', '500' , '600' , '700', '800'], 
  display: 'swap',
  variable: '--font-baloo2',
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500' , '600' , '700', '800'],
  display: 'swap',
  variable: '--font-roboto',
});

export const amaticSC = {
  name: '"Amatic SC"',
  weights: ['400', '700',],
};
