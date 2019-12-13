FROM python:3.7

VOLUME /app
COPY . /app

WORKDIR /app

RUN pip3 install -r requirements.txt

EXPOSE 8085

ENTRYPOINT ["python3"]

CMD ["app.py"]

# This default user is created in the openshift docker images image
USER 1001
