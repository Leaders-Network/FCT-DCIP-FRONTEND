/**
 * FCT (Federal Capital Territory) Locations - LGAs and Districts/Wards
 * Used for Builder Liability Policy form dropdowns
 */

export interface District {
  value: string;
  label: string;
}

export interface LGA {
  value: string;
  label: string;
  districts: District[];
}

export const FCT_LOCATIONS: LGA[] = [
  {
    value: 'amac',
    label: 'Abuja Municipal Area Council (AMAC)',
    districts: [
      { value: 'city_centre', label: 'City Centre' },
      { value: 'wuse', label: 'Wuse' },
      { value: 'garki', label: 'Garki' },
      { value: 'gwarinpa', label: 'Gwarinpa' },
      { value: 'kabusa', label: 'Kabusa' },
      { value: 'jiwa', label: 'Jiwa' },
      { value: 'gui', label: 'Gui' },
      { value: 'karshi', label: 'Karshi' },
      { value: 'orozo', label: 'Orozo' },
      { value: 'karu', label: 'Karu' },
      { value: 'nyanya', label: 'Nyanya' },
      { value: 'gwagwa', label: 'Gwagwa' }
    ]
  },
  {
    value: 'bwari',
    label: 'Bwari Area Council',
    districts: [
      { value: 'bwari_central', label: 'Bwari Central' },
      { value: 'byazhin', label: 'Byazhin' },
      { value: 'dutse', label: 'Dutse' },
      { value: 'igu', label: 'Igu' },
      { value: 'kawu', label: 'Kawu' },
      { value: 'kubwa', label: 'Kubwa' },
      { value: 'kuduru', label: 'Kuduru' },
      { value: 'shere', label: 'Shere' },
      { value: 'ushafa', label: 'Ushafa' },
      { value: 'usuma', label: 'Usuma' }
    ]
  },
  {
    value: 'gwagwalada',
    label: 'Gwagwalada Area Council',
    districts: [
      { value: 'gwagwalada_central', label: 'Gwagwalada Central' },
      { value: 'kutunku', label: 'Kutunku' },
      { value: 'staff_quarters', label: 'Staff Quarters' },
      { value: 'ibwa', label: 'Ibwa' },
      { value: 'dobi', label: 'Dobi' },
      { value: 'paiko', label: 'Paiko' },
      { value: 'tungan_maje', label: 'Tungan Maje' },
      { value: 'zuba', label: 'Zuba' },
      { value: 'ikwa', label: 'Ikwa' },
      { value: 'gwako', label: 'Gwako' }
    ]
  },
  {
    value: 'kuje',
    label: 'Kuje Area Council',
    districts: [
      { value: 'kuje_central', label: 'Kuje Central' },
      { value: 'chibiri', label: 'Chibiri' },
      { value: 'gaube', label: 'Gaube' },
      { value: 'kwaku', label: 'Kwaku' },
      { value: 'kabi', label: 'Kabi' },
      { value: 'rubochi', label: 'Rubochi' },
      { value: 'gwargwada', label: 'Gwargwada' },
      { value: 'gudunkariya', label: 'Gudunkariya' },
      { value: 'kujekwa', label: 'Kujekwa' },
      { value: 'yenche', label: 'Yenche' }
    ]
  },
  {
    value: 'kwali',
    label: 'Kwali Area Council',
    districts: [
      { value: 'kwali_central', label: 'Kwali Central' },
      { value: 'ashara', label: 'Ashara' },
      { value: 'dafa', label: 'Dafa' },
      { value: 'gumbo', label: 'Gumbo' },
      { value: 'kilankwa', label: 'Kilankwa' },
      { value: 'kundu', label: 'Kundu' },
      { value: 'pai', label: 'Pai' },
      { value: 'yangoji', label: 'Yangoji' },
      { value: 'yebu', label: 'Yebu' },
      { value: 'wako', label: 'Wako' }
    ]
  },
  {
    value: 'abaji',
    label: 'Abaji Area Council',
    districts: [
      { value: 'abaji_central', label: 'Abaji Central' },
      { value: 'abaji_north_east', label: 'Abaji North East' },
      { value: 'abaji_south_east', label: 'Abaji South East' },
      { value: 'alu_mamagi', label: 'Alu Mamagi' },
      { value: 'gawu', label: 'Gawu' },
      { value: 'gurdi', label: 'Gurdi' },
      { value: 'nuku', label: 'Nuku' },
      { value: 'rimba_ebagi', label: 'Rimba Ebagi' },
      { value: 'yaba', label: 'Yaba' },
      { value: 'agyana_pandagi', label: 'Agyana/Pandagi' }
    ]
  }
];

/**
 * Get districts for a specific LGA
 */
export const getDistrictsByLGA = (lgaValue: string): District[] => {
  const lga = FCT_LOCATIONS.find(l => l.value === lgaValue);
  return lga ? lga.districts : [];
};

/**
 * Get LGA label by value
 */
export const getLGALabel = (lgaValue: string): string => {
  const lga = FCT_LOCATIONS.find(l => l.value === lgaValue);
  return lga ? lga.label : '';
};

/**
 * Get district label by LGA and district value
 */
export const getDistrictLabel = (lgaValue: string, districtValue: string): string => {
  const lga = FCT_LOCATIONS.find(l => l.value === lgaValue);
  if (!lga) return '';
  const district = lga.districts.find(d => d.value === districtValue);
  return district ? district.label : '';
};
