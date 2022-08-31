# read fullDockerPath 
fullDockerPath=$1
containerKey=$2

mkdir -p $fullDockerPath/$containerKey
cp -r $fullDockerPath/Dockerfile $fullDockerPath/$containerKey/
docker build --quiet -t $containerKey $fullDockerPath/$containerKey/


# run docker and save output to file
echo $(docker run --rm -v $fullDockerPath/$containerKey:/usr/app/src $containerKey)

sleep 1
# remove $containerKey folder
rm -rf $fullDockerPath/$containerKey
