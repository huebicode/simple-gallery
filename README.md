# Simple Gallery

A minimalistic image gallery slider and lightbox with mouse, touch and keyboard support.

![Simple Gallery Example](https://github.com/user-attachments/assets/cffaf7a6-24d6-439a-9a79-7344b877a11c)

Photography under the [Unsplash License](https://unsplash.com/license) by:
- [Louis Pellissier](https://unsplash.com/photos/wJ2SaSiL5FA)
- [Hannes Egler](https://unsplash.com/de/fotos/6SLdXXVYQpo)
- [Takahiro Taguchi](https://unsplash.com/photos/ODXZTJC5odw)
- [Forrest Cavale](https://unsplash.com/photos/qfmd9bu7IgA)
- [Hendrik Schuette](https://unsplash.com/photos/vlxdsFMKEww)
- [Tobias Keller](https://unsplash.com/de/fotos/73F4pKoUkM0)

## Usage

- Import the script with:
```html
<script src="simple-gallery.js"></script>
```

- For images, which should receive lightbox functionality, set the class of the image to <code>-lightbox</code>:
```html
<img src="your-image.jpg" class="-lightbox">
```

- For a gallery slider, wrap the images into a <code>div</code> with <code>class="-gallery"</code>. Additionally add <code>-lightbox</code>, if lightbox functionality is desired:
```html
<div class="-gallery -lightbox">
    <img src="your-image1.jpg">
    <img src="your-image2.jpg">
    <img src="your-image3.jpg">
</div>
```
