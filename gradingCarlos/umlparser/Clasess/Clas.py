# CLASSES
class Clas:
    DOUBLE_NEWLINE = '\n\n'
    NEWLINE = '\n'
    EXTEND = '<|--'
    IMPLEMENT = '<|..'
    INT_IMPLEMENT = '<..'
    COMPOSITION = '*--'
    AGGREGATION = 'o--'
    SP = ' '

    # Constructor, init project
    def __init__(self):

        self.classes = []
        self.clas_object = {}

    def add_class(self, classes_in_file):
        for clas in classes_in_file:
            self.classes.append(clas)
            clas_name, int_implements, clas_container = self.get_class_container(clas)
            implements = []
            try:
                implements = clas.implements if clas.implements != None or clas.implements == undefined else []
            except:
                pass
            extends = clas.extends if clas.extends != None else []
            interface = False
            self.clas_object[clas_name] = {
                "container":clas_container,
                "extends":extends,
                "implements":implements,
                "int_implements":int_implements,
                "interface":interface
            }

    def get_class_container(self, clas):

        # Only Include Private and Public Attributes
        str_attr = ""
        implements = []

        for attr in clas.body:
            # Only Include Private and Public Attributes
            attribute = {}
            valid_modifier = None
            # Check if Attribute is Private or Public
            for value in attr.modifiers:
                if value == 'private' or value == 'public':
                    valid_modifier = value
            if valid_modifier == None:
                continue
            else:
                attribute["modifier"] = valid_modifier

            # Get Type of Attribute
            dim = ""
            try:
                if len(attr.type.dimensions) > 0:
                    dimen = attr.type.dimensions[-1] if attr.type.dimensions[-1] != None else ""
                    dim = "["+dimen+"]"
            except:
                pass

            try:
                attribute["name"] = attr.declarators.pop(-1).name
                collection_name = attribute["name"].upper()
            except:
                pass

            try:
                collection_name = attr.type.children[2][0].children[0].children[0]
            except:
                pass

            try:
                if attr.type.name == "Collection":
                    attribute["type"] = attr.type.name + "<"+collection_name+">"
                    implements.append(collection_name)
                else:
                    attribute["type"] = attr.type.name + dim
                    if any(x.isupper() for x in attribute["type"]):
                        implements.append(attr.type.name)
            except:
                pass

            str_attr = str_attr + self.to_str(clas.name, attribute)
        return clas.name, implements, str_attr

    def write_to_file(self, fileHandler):
        fileHandler.write("@startuml\n")
        for key in self.clas_object.keys():
            clas = self.clas_object[key]
            for item in clas.keys():
                elements = clas[item]
                if item == "container":
                    fileHandler.write(elements+self.NEWLINE)
                if item == "extends":
                    counter = 0
                    for element in elements:
                        ele = ""
                        try:
                            ele = elements.name
                        except:
                            pass
                        try:
                            ele = element[counter].name
                        except:
                            pass
                        try:
                            ele = element.name
                        except:
                            pass

                        fileHandler.write(key+self.SP+self.EXTEND+self.SP+ele+self.NEWLINE)
                        counter += 1
                if item == "implements":
                    counter = 0
                    for element in elements:
                        ele = ""
                        try:
                            ele = elements.name
                        except:
                            pass
                        try:
                            ele = element[counter].name
                        except:
                            pass
                        try:
                            ele = element.name
                        except:
                            pass
                        fileHandler.write(key+self.SP+self.IMPLEMENT+self.SP+ele+self.NEWLINE)
                        counter += 1

                if item == "int_implements":
                    for element in elements:
                        fileHandler.write(key+self.SP+self.INT_IMPLEMENT+self.SP+element+self.NEWLINE)

        fileHandler.write("@enduml")

        pass

    def to_str(self,clas_name, att):
        for item in att:
            str_obj = clas_name + " : "+att[item]+" "
        str_obj = str_obj + '\n'
        return str_obj