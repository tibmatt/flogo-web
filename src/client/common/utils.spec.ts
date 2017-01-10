import { parseMapping } from './utils';


describe('Function: ParseMapping', ()=> {

    describe('Evaluating an activity', () => {
        beforeEach(() => {
            this.parsedMapping = parseMapping("{A20.message}.category.id");
        });

        it('Should extract the correct attribute name', ()=> {
             expect(this.parsedMapping.attributeName).toEqual('message');
        });

        it('Should extract the correct taskId', ()=> {
         expect(this.parsedMapping.taskId).toEqual('20');
        });

        it ('It cannot be root', ()=> {
            expect(this.parsedMapping.isRoot).toEqual(false);
        });

        it('Should extract the path', ()=> {
            expect(this.parsedMapping.path).toEqual('category.id');
        });
    });

    describe('Evaluating a trigger', ()=> {
        beforeEach(() => {
            this.parsedMapping = parseMapping("{T.pathParams}");
        });

        it('Should extract the correct attribute name', ()=> {
            expect(this.parsedMapping.attributeName).toEqual('pathParams');
        });

        it('Should be root', ()=> {
            expect(this.parsedMapping.isRoot).toEqual(true);
        });

        it('taskId should be null', ()=> {
            expect(this.parsedMapping.taskId).toBeNull();
        });
    });

    describe('Bad input', () => {
        it('On Unknown Z type should return null', ()=> {
            let parsedMapping:any = parseMapping("{Z.pathParams}");
            expect(parsedMapping).toBeNull();
        });

        it('On unclosed curly braces should return null', ()=> {
            let parsedMapping:any = parseMapping("{A.pathParams");
            expect(parsedMapping).toBeNull();
        });
    })

});





