/**
 * Size chart definitions.
 * Each chart has a label (shown in admin dropdown) and a table definition.
 * Add or edit charts here — product detail page picks them up automatically.
 */
 
export const SIZE_CHART_OPTIONS = [
  { value: 'kids',           label: 'Kids (Boys & Girls)' },
  { value: 'women_standard', label: 'Women — Shalwar Kameez / Suits' },
  { value: 'women_maxi',     label: 'Women — Maxi Dress' },
  { value: 'men_standard',   label: 'Men — Shalwar Kameez' },
  { value: 'men_western',    label: 'Men — Shirts / Pants' },
];
 
/**
 * columns: array of column header strings
 * rows: array of { size, ...measurements }
 */
export const SIZE_CHARTS = {
 
  kids: {
    title: 'Kids Size Chart',
    note: 'Sizes are age-based. Measurements in inches.',
    columns: ['Age / Size', 'Chest', 'Length (Kameez)', 'Waist', 'Trouser Length'],
    rows: [
      { label: '1–2 Years',  chest: '22"', length: '20"', waist: '20"', trouser: '18"' },
      { label: '3–4 Years',  chest: '24"', length: '23"', waist: '22"', trouser: '21"' },
      { label: '5–6 Years',  chest: '26"', length: '26"', waist: '24"', trouser: '24"' },
      { label: '7–8 Years',  chest: '28"', length: '29"', waist: '26"', trouser: '27"' },
      { label: '9–10 Years', chest: '30"', length: '32"', waist: '28"', trouser: '30"' },
      { label: '11–12 Years',chest: '32"', length: '35"', waist: '30"', trouser: '33"' },
      { label: '13–14 Years',chest: '34"', length: '38"', waist: '32"', trouser: '36"' },
    ],
  },
 
  women_standard: {
    title: 'Women Size Chart — Shalwar Kameez / Suits',
    note: 'All measurements in inches. For the best fit, measure over light clothing.',
    columns: ['Size', 'Chest', 'Waist', 'Hips', 'Kameez Length', 'Shoulder'],
    rows: [
      { label: 'XS',  chest: '33"', waist: '27"', hips: '35"', length: '52"', shoulder: '13.5"' },
      { label: 'S',   chest: '35"', waist: '29"', hips: '37"', length: '53"', shoulder: '14"'   },
      { label: 'M',   chest: '37"', waist: '31"', hips: '39"', length: '54"', shoulder: '14.5"' },
      { label: 'L',   chest: '39"', waist: '33"', hips: '41"', length: '55"', shoulder: '15"'   },
      { label: 'XL',  chest: '41"', waist: '35"', hips: '43"', length: '56"', shoulder: '15.5"' },
      { label: '2XL', chest: '43"', waist: '37"', hips: '45"', length: '57"', shoulder: '16"'   },
    ],
  },
 
  women_maxi: {
    title: 'Women Size Chart — Maxi Dress',
    note: 'All measurements in inches. Full-length maxi — length measured from shoulder to hem.',
    columns: ['Size', 'Chest', 'Waist', 'Hips', 'Full Length', 'Shoulder'],
    rows: [
      { label: 'XS',  chest: '33"', waist: '27"', hips: '35"', length: '54"', shoulder: '13.5"' },
      { label: 'S',   chest: '35"', waist: '29"', hips: '37"', length: '55"', shoulder: '14"'   },
      { label: 'M',   chest: '37"', waist: '31"', hips: '39"', length: '56"', shoulder: '14.5"' },
      { label: 'L',   chest: '39"', waist: '33"', hips: '41"', length: '57"', shoulder: '15"'   },
      { label: 'XL',  chest: '41"', waist: '35"', hips: '43"', length: '58"', shoulder: '15.5"' },
      { label: '2XL', chest: '43"', waist: '37"', hips: '45"', length: '59"', shoulder: '16"'   },
    ],
  },
 
  men_standard: {
    title: 'Men Size Chart — Shalwar Kameez',
    note: 'All measurements in inches.',
    columns: ['Size', 'Chest', 'Shoulder', 'Kameez Length', 'Waist', 'Trouser Length'],
    rows: [
      { label: 'S',   chest: '38"', shoulder: '16"',  length: '42"', waist: '32"', trouser: '40"' },
      { label: 'M',   chest: '40"', shoulder: '16.5"', length: '43"', waist: '34"', trouser: '41"' },
      { label: 'L',   chest: '42"', shoulder: '17"',  length: '44"', waist: '36"', trouser: '42"' },
      { label: 'XL',  chest: '44"', shoulder: '17.5"', length: '45"', waist: '38"', trouser: '43"' },
      { label: '2XL', chest: '46"', shoulder: '18"',  length: '46"', waist: '40"', trouser: '44"' },
    ],
  },
 
  men_western: {
    title: 'Men Size Chart — Shirts / Pants',
    note: 'All measurements in inches.',
    columns: ['Size', 'Chest', 'Shoulder', 'Shirt Length', 'Waist', 'Inseam'],
    rows: [
      { label: 'S',   chest: '38"', shoulder: '16"',   length: '29"', waist: '30"', inseam: '30"' },
      { label: 'M',   chest: '40"', shoulder: '16.5"', length: '30"', waist: '32"', inseam: '31"' },
      { label: 'L',   chest: '42"', shoulder: '17"',   length: '31"', waist: '34"', inseam: '32"' },
      { label: 'XL',  chest: '44"', shoulder: '17.5"', length: '32"', waist: '36"', inseam: '33"' },
      { label: '2XL', chest: '46"', shoulder: '18"',   length: '33"', waist: '38"', inseam: '34"' },
    ],
  },
};
 