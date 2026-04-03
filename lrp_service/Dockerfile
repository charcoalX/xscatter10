FROM tensorflow/tensorflow:1.4.0

WORKDIR /app

RUN pip install Flask==1.0.4 Werkzeug==0.16.1 Pillow==5.4.1 matplotlib==2.2.5 scipy==1.1.0

COPY data/ /data/
COPY resnet_src/ resnet_src/
COPY lrp_engine.py app.py ./

EXPOSE 5001
CMD ["python", "app.py"]
