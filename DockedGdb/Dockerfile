# GDB
#
# VERSION 1

# use the ubuntu base image provided by dotCloud
FROM ubuntu

MAINTAINER Harry Eakins

# make sure the package repository is up to date
RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update

# install memcached
RUN apt-get install -y build-essential gdb strace vim

RUN adduser --disabled-password --gecos "" gdb_user

USER gdb_user

ADD debug.sh /home/gdb_user/debug.sh
ADD Arduino.h /home/gdb_user/Arduino.h
ADD ArduinoAfter.h /home/gdb_user/ArduinoAfter.h
