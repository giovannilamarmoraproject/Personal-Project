FROM nginx:alpine

# Rimuovi la configurazione predefinita di nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copia la configurazione personalizzata per gestire sia il dominio principale che i sottodomini dedicati
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia tutti i file del server (Central Hub, assets, the-real-marza, costi-casa, etc.)
COPY . /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/nginx.conf /usr/share/nginx/html/VERSION

# Esponi la porta HTTP
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
