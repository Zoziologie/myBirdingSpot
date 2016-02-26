clear all; clc
Region='FR'; %'IS', 'CA-QC', 'FR'
Region_out='FR-A';
% read data
hotspot=readtable(['ebird_api_hotspot/ebird_api_hotspots_', Region, '.csv'],'Delimiter',',','ReadVariableNames',false,'FileEncoding','UTF-8');
MyData=readtable('MyEbirdData/MyEBirdData_08_2015.csv','Delimiter',',','ReadVariableNames',false,'FileEncoding','UTF-8');

% put Variable names of MyData
VariableNames=table2cell(MyData(1,:));
for i=1:length(VariableNames)
    str=char(VariableNames{i});
    VariableNames{i}= str(~ismember(str,' /()'));
end
MyData.Properties.VariableNames=VariableNames;
MyData(1,:)=[];

%Delete uneeded MyData
n_mydata=numel(MyData.Location);I=[];
for i=1:n_mydata
    if isempty(strfind(MyData.StateProvince{i},Region_out))
        I=[I;i];
    end
end
MyData(I,:)=[];
n_mydata=numel(MyData.Location);

% Put correct Variable name
if strcmp(Region,'CA-QC') || strcmp(Region,'FR')
    hotspot(:,end)=[];
end
hotspot.Properties.VariableNames={'ID','Country','StateProvince','County','Latitude','Longitude','Location'};
clear i VariableNames


% Unique Location
[uni.Location,ia]=unique(MyData.Location);
uni.Latitude=MyData.Latitude(ia);
uni.Longitude=MyData.Longitude(ia);
uni.StateProvince=MyData.StateProvince(ia);
uni.County=MyData.County(ia);


% Birdlist per location
n_uni=numel(uni.Location);
uni.birdlist=cell(n_uni,1);
uni.checklist=cell(n_uni,1);
uni.birdnb=zeros(n_uni,1);

for i=1:n_mydata
    for j=1:n_uni
        if strcmp(MyData.Location{i},uni.Location{j}) % Location i is in my data
            
            if isempty(strfind(uni.birdlist{j}, MyData.CommonName{i}))
                if isempty(uni.birdlist{j})
                    uni.birdlist{j}='"';
                end
                uni.birdlist{j}=[uni.birdlist{j} , MyData.CommonName{i}, ', '];
                uni.birdnb(j)=uni.birdnb(j)+1;
            end
            
            uni.checklist{j}=[uni.checklist{j}; {MyData.SubmissionID{i}}];
        end
        if i==n_mydata % put " at the end of each uni
            uni.birdlist{j}=[uni.birdlist{j}(1:end-2) ,'"'];
        end
        
    end
end

% Link eBird website
n_hot=numel(hotspot(:,1));
uni.id=cell(n_uni,1);
for j=1:n_uni
    for u=1:n_hot
        if strcmp(hotspot.Location(u),uni.Location(j))
            uni.id(j)=hotspot.ID(u);
        end
    end
end


% Table Title 
uni.Title=cell(n_uni,1);
for j=1:n_uni
    if isempty(uni.id{j}) % if it it has a hotpost link
        uni.Title{j}=['"', uni.Location{j}, ' (',uni.StateProvince{j}];
    else
        uni.Title{j}=['"<a href=''http://ebird.org/ebird/hotspot/',uni.id{j},  ''' target=''_blank''>',uni.Location{j},'</a> (',uni.StateProvince{j}];
    end
    
    if ~isempty(uni.County{j}) % If it has a county code
        uni.Title{j} =[ uni.Title{j}, '-',uni.County{j},')"'];
    else
        uni.Title{j} =[ uni.Title{j}, ')"'];
    end
end

% Description Maker
uni.Description=cell(n_uni,1); 
for j=1:n_uni
    uni.Description{j}=uni.birdlist{j}(1:end-1);
    uni.checklist{j}=unique(uni.checklist{j});
    for w= 1:numel(uni.checklist{j})
        uni.Description{j}= [ uni.Description{j}, ' - <a href=''http://ebird.org/ebird/view/checklist?subID=',uni.checklist{j}{w},  ''' target=''_blank''>Checklist ', uni.checklist{j}{w} ,'</a>']; 
    end
    uni.Description{j}= [ uni.Description{j},'"'];
end

T=table(uni.Latitude,uni.Longitude,uni.Title,uni.Description,'VariableNames',{'Latitude','Longitude','Title','Description'});

% Remove all non-hotspot
 T(~strncmp('"<a h',T.Title,4),:)=[];

writetable(T,['Location_', Region_out, '.csv'])




% Location raking
[~,idx]=sort(uni.birdnb,'descend');
disp( uni.Location(idx(1:5)) )
disp( uni.birdnb(idx(1:5)) )
disp( uni.birdnb(idx(1:5))/42)

total=102;
div=cell(10,1);
fileID = fopen('myfile.txt','w');
for i=1:10
    a=['<div class="fusion-progressbar progress-bar" style="background-color: #f6f6f6;"><div class="progress progress-bar-content" style="width: ', num2str(uni.birdnb(idx(i))/total*100) ,'%; background-color: #fbbd58;"></div><span class="progress-title sr-only" style="color: #0a0a0a;"><a href="http://ebird.org/ebird/hotspot/', num2str(uni.id{idx(i)}),'" target="_blank">', num2str(i), '. ' , uni.Location(idx(i)) ,' - ', num2str(uni.birdnb(idx(i))), ' sp.', '</a>', '</span></div>'];
    disp([a{:}])
    fprintf(fileID,'%s\n',[a{:}]);
end
    
