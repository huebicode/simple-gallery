# Simple Gallery

A minimalistic image gallery slider and lightbox with mouse, touch and keyboard support.

[simple-gallery-demo.webm](https://github.com/user-attachments/assets/137bfcc5-1603-4b7c-a9d1-f830f54571c1)

Photography under the [Unsplash License](https://unsplash.com/license) by:
- [Louis Pellissier](https://unsplash.com/photos/wJ2SaSiL5FA)
- [Hannes Egler](https://unsplash.com/de/fotos/6SLdXXVYQpo)
- [Takahiro Taguchi](https://unsplash.com/photos/ODXZTJC5odw)
- [Forrest Cavale](https://unsplash.com/photos/qfmd9bu7IgA)
- [Hendrik Schuette](https://unsplash.com/photos/vlxdsFMKEww)
- [Tobias Keller](https://unsplash.com/de/fotos/73F4pKoUkM0)

## Usage

- Import the script:
```html
<script src="simple-gallery.js"></script>
```

- For images, which should receive lightbox functionality, set the class of the image to <code>-lightbox</code>:
```html
<img src="image.avif" class="-lightbox">
```

- For a gallery slider, wrap the images into a <code>div</code> with the class <code>-gallery</code>. Additionally add <code>-lightbox</code>, if lightbox functionality is desired:
```html
<div class="-gallery -lightbox">
    <img src="image1.avif">
    <img src="image2.avif">
    <img src="image3.avif">
</div>
```
