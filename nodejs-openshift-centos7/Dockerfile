# nodejs-openshift-centos7
FROM openshift/base-centos7

MAINTAINER srivatsabc@gmail.com

EXPOSE 8080

RUN curl -sL https://rpm.nodesource.com/setup_8.x | bash - && \
    yum install nodejs -y  && yum clean all

# Copy the S2I scripts from the specific language image to $STI_SCRIPTS_PATH
LABEL io.openshift.s2i.scripts-url=image:///usr/local/s2i
COPY ./s2i/bin/ /usr/local/s2i

# Drop the root user and make the content of /opt/app-root owned by user 1001
RUN chown -R 1001:1001 /opt/app-root

USER 1001
