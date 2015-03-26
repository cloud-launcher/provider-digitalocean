#!/bin/bash

PROVIDER=$1 #The name of the new provider
PROVIDER_DIR=provider-$PROVIDER

cd ..

git clone git@github.com:cloud-launcher/provider-template $PROVIDER_DIR

cd $PROVIDER_DIR

git remote rename origin upstream
git remote add origin git@github.com:cloud-launcher/$PROVIDER_DIR

git rm create_provider.sh
git rm Readme.md
git mv Readme.provider.md Readme.md
git commit -m "New provider initialization"

git push origin master