import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(compression());
app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

let renderer;
fs.readFile(path.resolve(__dirname, 'dist/index.html'), 'utf-8', (err, html) => {
    if (err) throw err;
    const parts = html.split('<!--ssr-outlet-->');
    renderer = (url, appHtml) => parts[0] + appHtml + parts[1];
});

app.use('*', async (req, res) => {
    try {
        const url = req.originalUrl;
        const { render } = await import('./dist-ssr/entry-server.js');
        const appHtml = await render({ path: url });
        const finalHtml = renderer(url, appHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    } catch (e) {
        console.log(e.stack);
        res.status(500).end(e.stack);
    }
});

const port = process.env.PORT || 5173;
app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});