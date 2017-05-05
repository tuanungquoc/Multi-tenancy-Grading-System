#!/usr/local/bin/python3
# umlparser.py
# Author: Carlos Martinez
#
# Overview:
# Input:
#   <source folder>
#   <output file name>
# Output:
#   Class Diagram in png format

import sys
import javalang
import os
import argparse
from subprocess import Popen
from Clasess.Clas import Clas
from pathlib import Path

# Helper functions
#===================================================#

def get_trees_from_dir(directory):
    # parse a compilation unit from a string

    # Variable to hold trees from files in directory
    treeArray = []

    # Walk the directory passed into the function
    for dirpath, dnames, files in os.walk(directory):
        for file in files:

            # Check if the file is a '.java' file
            if file.endswith(".java"):
                # Parse and store tree in array
                treeArray.append(javalang.parse.parse(open(directory+'/' + file, 'r').read()))

    return treeArray

# Main Function
#===================================================#
def main(argv):

    parser = argparse.ArgumentParser(description='Java to UML drawing converter')
    parser.add_argument('-s', '--source', help='Path to the Java source file directory', required=True)
    args = vars(parser.parse_args())

    if not args["source"] :
        usage()
        return

    # Generate the report
    filename = parse_uml(args["source"])
    generateUML(filename)

# Methods
#===================================================#
def parse_uml(source_dir):

    print("Please check paths:")
    print("====================")

    dir = os.path.dirname(__file__)
    print("Project Directory: ", dir)

    fulldir = os.getcwd()+'/'+dir
    print("Full Project Dir: ", fulldir)

    current_dir = os.getcwd()
    print("Current Directory: ", current_dir)

    plantuml = os.path.join(fulldir, 'plantuml.jar')
    print("Full Plantuml Dir: ", plantuml)

    output = os.path.join(dir, 'Output.txt')
    print("Output.txt: ", output)

    sourceArray = [x for x in source_dir.split('/') if x]
    new_source = '/'.join(sourceArray)
    print("New Source: ", new_source)
    source = os.path.join(current_dir, new_source)
    print("Source files: ", source)

    final_output = os.path.join(fulldir, 'Output.png')
    print("Output.png: ", final_output)

    # Parse all files from directory
    treeArray = get_trees_from_dir(source)

    # Open text file and get handler
    text_file = open(output, "w")

    clas = Clas()
    for file in treeArray:
        # Class Level
        # here we create the class boxes with fields or methods names
        clas.add_class(file.types)
    print("Finish")
    clas.write_to_file(text_file)


    my_file = Path(output)
    print("Lets Check if Output.txt is available...")
    if my_file.is_file():
        print("Found it, Going to execute Java...")
        print(str(Popen(['java', '-jar', plantuml, output], cwd=os.getcwd())))
        print("Output.png file can be found at: ", final_output)
    else:
        print("Output not found, aborting....")

def generateUML(filename):
    pass

# Setup and Initiation
#===================================================#
def usage():
    print('usage: umlparser.py <source folder> <output file name>')
    print('example: python3 umlparser.py /dir/Test.java /output/test.png')
    exit(1)

if __name__ == "__main__":
    main(sys.argv[1:])

