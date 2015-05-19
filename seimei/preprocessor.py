import csv
import sys
import os

if __name__ == '__main__':
    
    if len(sys.argv) != 3:
        print "Usage: python preprocessor.py <input file path> <output file path>"
        sys.exit(1)
    
    write = True
    in_path = sys.argv[1]
    out_path = sys.argv[2] 
    header = ["video_ID", "uploader", "age", "category", "length", 
              "views", "rate", "ratings", "comments", "related_IDs"]
    rid_idx = header.index("related_IDs")
    rate_categ = ["0 ~ 0.9", "1 ~ 1.9", "2 ~ 2.9", "3 ~ 3.9", "4 ~ 5"]
    view_categ = ["< 10000", "< 50000", "< 100000", ">= 100000"]
    
    counter = [0,0,0,0,0,0,0,0]
    
    rate_list = []
    view_list = []
    
    if os.path.exists(in_path):
        lis = []
        with open(in_path) as f:
            for line in f:
                tmp = line.split("\t")
                
                # Group related IDs together
                tmp = tmp[0:rid_idx] + [",".join(tmp[rid_idx:])]
                
                # Put "rate" into 5 bins
                rate_idx = header.index("rate")
                rate = float(tmp[rate_idx])
                if (rate >= 5):
                    tmp[rate_idx] = 5
                else: 
                    tmp[rate_idx] = int(rate)
                
                # Put "Views" into 4 bins
                views_idx = header.index("views")
                views = int(tmp[views_idx])
                if views < 10000:
                    tmp[views_idx] = 1
                elif views < 50000:
                    tmp[views_idx] = 2
                elif views < 100000:
                    tmp[views_idx] = 3
                else:
                    tmp[views_idx] = 4
                
                categ_idx = header.index("category")
                categ_val = tmp[categ_idx].lower()
                i = 0
                
                if categ_val == "comedy":
                    i = 1
                    counter[i - 1] = counter[i - 1] + 1
                elif categ_val == "entertainment":
                    i = 2
                    counter[i - 1] = counter[i - 1] + 1
                elif categ_val == "film & animation":
                    i = 3
                    counter[i - 1] = counter[i - 1] + 1
                elif categ_val == "music":
                    i = 4
                    counter[i - 1] = counter[i - 1] + 1
                elif categ_val == "news & politics":
                    i = 5
                    counter[i - 1] = counter[i - 1] + 1
                elif categ_val == "people & blogs":
                    i = 6
                    counter[i - 1] = counter[i - 1] + 1
                elif categ_val == "sports":
                    i = 7
                    counter[i - 1] = counter[i - 1] + 1
                else:
                    print categ_val
                    i = 8
                    counter[i - 1] = counter[i - 1] + 1
                    
                tmp[categ_idx] = i
                                    
                #print tmp
                lis.append(tmp)
            
        for count in counter:
            print count
        
        if ".csv" not in out_path:
            out_path += ".csv"
            
        if write:
            with open(out_path, 'w') as csvfile:
                writer = csv.writer(csvfile, delimiter=',')
                writer.writerow(header)
                
                for line in lis:
                    writer.writerow(line)