// Método para filtrar banners por sección
// Añade este método dentro de la clase AdminComponent
filterBanners(section: string): void {
  this.bannerFilter = section;
  if (section === 'all') {
    this.filteredBanners = this.banners;
  } else {
    this.filteredBanners = this.banners.filter(banner => banner.seccion === section);
  }
}
