FROM ubuntu

COPY systemctl.py /usr/bin/systemctl

RUN chmod +x /usr/bin/systemctl

RUN test -L /bin/systemctl || ln -sf /usr/bin/systemctl /bin/systemctl

CMD ["/bin/bash"]
