#!/bin/bash
echo "========================================================="
echo "Starting Local environment"

if [ -d ".env" ];
then
	echo "Enabling virtual environment"
else
	echo "No virtual environment pls run setup.sh first"
	exit N
fi

. .env/bin/activate

export ENV=development

celery -A app.celery worker -l info

deactivate