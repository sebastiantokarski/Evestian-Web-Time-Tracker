import colors from '../scss/common/_colors.scss';

class Color {
  constructor(name) {
    this.color = colors[name];
  }

  static getAvailableColors() {
    return colors;
  }

  static isRGB(rgb) {
    return /^rgb\([\d\s,]+\)$/.test(rgb);
  }

  toRGB() {
    const bigint = parseInt(this.color.replace(/^#/, ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgb(${r}, ${g}, ${b})`;
  }

  toRGBa(opacity) {
    if (Color.isRGB(this.color)) {
      return this.color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    return this.toRGB(this.color).replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
}

export default Color;
