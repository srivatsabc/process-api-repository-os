FROM python:3.7

VOLUME /app
COPY . /app

WORKDIR /app

RUN pip3 install -r requirements.txt

EXPOSE 8085

ENTRYPOINT ["python3"]

CMD ["app.py"]

# This is the default user for running docker container in OpenShift
USER 1001
