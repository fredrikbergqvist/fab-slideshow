fab-slideshow
=============


Configuration options
---------------------


```javascript
$(".fab-slideshow").fabSlideshow(
{
    'autoRotate' : true,
    'slideInterval': 5000
});
```

HTML Markup
-----------

Below is the bear necessities for making the plugin work.

The plugin will autogenerate the preview window

```html
<div class="fab-slideshow">
    <ul class="fab-slideshow-container">
        <li class="fab-slideshow-item">
            <a href="#">
                <img src="images/1.jpg" alt="Dummy image">
                <div class="fab-slideshow-item-text">
                    <h3>Dummy image 1</h3>
                    <p>Lorem ipsum dolor sit amet...</p>
                </div>
            </a>
        </li>
    </ul>
</div>
```


Events
------

The slideshow will trigger events on start, stop and slide selected
<dl>
<dt>Slideshow Started</dt>
<dd>fabSlideshowStarted</dd>

<dt>Stopped</dt>
<dd>fabSlideshowStopped</dd>

<dt>Slide selected</dt>
    <dd>slide number: (integer) Number of the slide selected (from 0 - end)</dd>
    <dd>isAuto: (boolean) True if the slide was automatically selected, false if selected via the preview window.</dd>
<dd>fabSlideshowSlideSelected</dd>
<dd>param: (int) slide number, (bool) isAuto</dd>

<dt>Slide deselected</dt>
<dd>slide number: (integer) Number of the slide deselected (from 0 - end)</dd>
<dd>isAuto: (boolean) True if the slide was automatically selected, false if selected via the preview window.</dd>
<dd>fabSlideshowSlideDeSelected</dd>
<dd>param: (int) slide number, (bool) isAuto</dd>
</dl>

Dependencies
-------------------

Tested with jQuery 1.10.2.
Tested in Chrome, Firefox and IE


License
----------

Copyright © 2013 Fredrik Bergqvist.
Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.

