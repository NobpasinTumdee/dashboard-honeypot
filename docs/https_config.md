# TLS version config (In case of https from Opencanary)
- เข้าไปแก้ที่ ~/Honeypot/Opencanary_env/lib/python3.12/site-packages/opencanary/modules/https.py
- แก้ในส่วนฟังก์ชัน getService โดยเพิ่มส่วนนี้เข้าไป

```bash
from OpenSSL import SSL

    def getService(self):
        page = BasicLogin(factory=self)
        root = StaticNoDirListing(self.staticdir)
        root.createErrorPages(self)
        root.putChild(b"", RedirectCustomHeaders(b"/index.html", factory=self))
        root.putChild(b"index.html", page)
        wrapped = EncodingResourceWrapper(root, [GzipEncoderFactory()])
        site = Site(wrapped)

        ctx_factory = DefaultOpenSSLContextFactory(
            privateKeyFileName=str(self.key_path),
            certificateFileName=str(self.certificate_path),
        )
        ctx = ctx_factory.getContext()

        ctx.set_options(SSL.OP_NO_TLSv1)
        ctx.set_options(SSL.OP_NO_TLSv1_1)
        ctx.set_options(SSL.OP_NO_TLSv1_3)

        return internet.SSLServer(
            self.port,
            site,
            ctx_factory,
            interface=self.listen_addr,
        )
```
- หากไม่มี OpenSSL เข้าไปใน venv แล้วติดตั้งคำสั่งด้านล่าง
```bash
pip install pyOpenSSL
```

# TLS version config (In case of https from nginx)
```bash
sudo nano /etc/nginx/sites-available/default
```
```bash
server {
    listen 443 ssl;
    server_name your.honeypot.local;

    ssl_certificate /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;

    ssl_protocols TLSv1.2;
    ssl_ciphers 'AES256-SHA:AES128-SHA:ARIA256-SHA:ARIA128-SHA';
    ssl_prefer_server_ciphers on;

    location / {
        root /var/www/html;
        index index.html;
    }
}
```