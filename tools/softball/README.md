# Local Three.js bundle

Run `npm ci` here, then:

```
./node_modules/.bin/esbuild three-entry.js --bundle --minify --format=esm --target=safari15 --outfile=../../assets/vendor/three-0.180.0.js
cp node_modules/three/LICENSE ../../assets/vendor/three-LICENSE
```

Pinned dependencies and lockfile are committed. The deployed page uses only the local bundle.
