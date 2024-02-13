# Excalidraw Colour Convert

When you are using Excalidraw dark mode, a filter\* is applied to the screen any colours you select for background/text/etc, this filter cannot easily be disabled or reversed. So this repo is a simple web app that will allow a colour input (the colour you want a background/text/etc to be in dark mode) and it will attempt to find a good approximation for a colour to provide to Excalidraw such that after the filter it will be close to your desired colour.

\* `transform: invert(93%) hue-rotate(180deg);`
