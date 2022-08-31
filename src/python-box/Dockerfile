#Deriving the latest base image
FROM python:latest

# install pandas
RUN pip install pandas
# install numpy
RUN pip install numpy


# Any working directory can be chosen as per choice like '/' or '/home' etc
# i have chosen /usr/app/src
WORKDIR /usr/app/src

#to COPY the remote file at working directory in container
COPY codeToRun.py ./
COPY data.csv ./
# Now the structure looks like this '/usr/app/src/test.py'


#CMD instruction should be used to run the software
#contained by your image, along with any arguments.

CMD [ "python", "./codeToRun.py"]
