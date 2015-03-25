#!/bin/bash

PROVIDER=$1 #The name of the new provider
PROVIDER_DIR=provider-$PROVIDER

cd ..

git clone git@github.com:cloud-launcher/provider-template $PROVIDER_DIR

cd $PROVIDER_DIR

git remote rename origin upstream
git remote add origin git@github.com:cloud-launcher/$PROVIDER_DIR

git rm create_provider.sh
git commit -m "Removed create_provider.sh script"

git push origin master