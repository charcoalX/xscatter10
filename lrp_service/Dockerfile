FROM xscatter-lrp-base

WORKDIR /app

RUN pip install Flask==1.0.4 Werkzeug==0.16.1

COPY data/ /data/
COPY resnet_src/ resnet_src/
COPY lrp_engine.py app.py ./

EXPOSE 5001
CMD ["python", "app.py"]
