FROM frolvlad/alpine-oraclejdk8
RUN apk --update add bash bash-doc bash-completion libstdc++ && rm -rf /var/cache/apk/*

ENV FLOGO_FLOW_SERVICE /flogo/flow-service
ENV FLOGO_FLOW_STATE_SERVICE /flogo/flow-state-service

COPY submodules/flogo-internal/flow-service/ /flogo/flow-service/

COPY submodules/flogo-internal/flow-state-service/ /flogo/flow-state-service/

RUN cd ${FLOGO_FLOW_SERVICE} && bash gradlew installDist
RUN cd ${FLOGO_FLOW_STATE_SERVICE} && bash gradlew installDist

COPY "docker/flow-services/start.sh" "/flogo"

ENV FLOGO_REDIS_HOST flogo-redis
WORKDIR /flogo
CMD ["bash", "start.sh"]
